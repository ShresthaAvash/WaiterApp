import React, {createContext, useReducer, useEffect, useContext, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from './AuthContext';
import {submitOrder} from '../api/orders';
import {fetchOrderForTable} from '../api/restaurant'; // <-- Import new function

export const OrderContext = createContext();

const orderReducer = (state, action) => {
  const {activeTableId} = state;
  const newOrdersByTable = {...state.ordersByTable};
  const currentOrder = newOrdersByTable[activeTableId] || { newItems: [], placedItems: [] };

  switch (action.type) {
    case 'SET_STATE':
      return {...state, ...action.payload};

    case 'SET_TABLE':
      return {...state, activeTableId: action.payload.tableId};

    case 'ADD_ITEM':
      // ... (this case remains the same)
      const {item, quantity, remarks} = action.payload;
      const itemRemarks = remarks || null; 

      const existingIndex = currentOrder.newItems.findIndex(
        i => i.id === item.id && i.remarks === itemRemarks
      );

      if (existingIndex > -1) {
        currentOrder.newItems[existingIndex].qty += quantity;
      } else {
        currentOrder.newItems.push({...item, qty: quantity, remarks: itemRemarks});
      }
      
      newOrdersByTable[activeTableId] = currentOrder;
      return {...state, ordersByTable: newOrdersByTable};
    
    case 'REMOVE_ITEM':
      // ... (this case remains the same)
      currentOrder.newItems = currentOrder.newItems.filter(
        item => !(item.id === action.payload.id && item.remarks === action.payload.remarks)
      );
      newOrdersByTable[activeTableId] = currentOrder;
      return {...state, ordersByTable: newOrdersByTable};

    case 'UPDATE_QTY':
      // ... (this case remains the same)
      currentOrder.newItems = currentOrder.newItems
        .map(item =>
          (item.id === action.payload.id && item.remarks === action.payload.remarks)
            ? {...item, qty: action.payload.qty}
            : item
        )
        .filter(item => item.qty > 0); 
      newOrdersByTable[activeTableId] = currentOrder;
      return {...state, ordersByTable: newOrdersByTable};

    // --- ADD THIS NEW CASE ---
    case 'SET_PLACED_ITEMS':
      currentOrder.placedItems = action.payload.items;
      newOrdersByTable[activeTableId] = currentOrder;
      return {...state, ordersByTable: newOrdersByTable};
    // --- END OF NEW CASE ---

    case 'SEND_TO_KITCHEN_SUCCESS':
      // Clear newItems, placedItems will be updated by a fetch
      newOrdersByTable[activeTableId] = {
        newItems: [],
        placedItems: newOrdersByTable[activeTableId]?.placedItems || [],
      };
      return {...state, ordersByTable: newOrdersByTable};

    case 'CLEAR_TABLE_ORDERS':
        delete newOrdersByTable[activeTableId];
        return {...state, ordersByTable: newOrdersByTable};

    default:
      return state;
  }
};

export const OrderProvider = ({children}) => {
  const [state, dispatch] = useReducer(orderReducer, {
    ordersByTable: {},
    activeTableId: null,
  });
  
  const [isOrderLoading, setOrderLoading] = useState(true);
  const {token} = useContext(AuthContext);

  useEffect(() => {
    const loadState = async () => {
      setOrderLoading(true);
      if (token) {
        const savedState = await AsyncStorage.getItem(`waiterOrders_${token}`);
        if (savedState) {
          // Only load the newItems, placedItems will be fetched
          const parsed = JSON.parse(savedState);
          Object.keys(parsed.ordersByTable).forEach(tableId => {
            if(parsed.ordersByTable[tableId]) {
              parsed.ordersByTable[tableId].placedItems = [];
            }
          });
          dispatch({type: 'SET_STATE', payload: parsed});
        }
      }
      setOrderLoading(false);
    };
    loadState();
  }, [token]);

  useEffect(() => {
    if (token && !isOrderLoading) {
      // Only save the newItems to storage
      const stateToSave = JSON.parse(JSON.stringify(state));
      Object.keys(stateToSave.ordersByTable).forEach(tableId => {
         if(stateToSave.ordersByTable[tableId]) {
            stateToSave.ordersByTable[tableId].placedItems = [];
         }
      });
      AsyncStorage.setItem(`waiterOrders_${token}`, JSON.stringify(stateToSave));
    }
  }, [state, token, isOrderLoading]);

  const removeItem = (id, remarks) => {
    dispatch({type: 'REMOVE_ITEM', payload: {id, remarks: remarks || null}});
  };

  const updateQuantity = (id, qty, remarks) => {
    dispatch({type: 'UPDATE_QTY', payload: {id, qty, remarks: remarks || null}});
  };
  
  const setTable = tableId => {
    dispatch({type: 'SET_TABLE', payload: {tableId}});
  };

  const addItemToOrder = (item, quantity = 1, remarks = '') => {
    dispatch({type: 'ADD_ITEM', payload: {item, quantity, remarks}});
  };

  // --- ADD THIS NEW FUNCTION ---
  const refreshPlacedItems = async () => {
    if (!state.activeTableId || !token) {
      return;
    }
    try {
      const items = await fetchOrderForTable(state.activeTableId);
      dispatch({type: 'SET_PLACED_ITEMS', payload: {items}});
    } catch (error) {
      console.error('Failed to refresh placed items:', error);
    }
  };

  const sendOrderToKitchen = async () => {
    const activeOrder = state.ordersByTable[state.activeTableId];
    if (!activeOrder || activeOrder.newItems.length === 0) {
      throw new Error('No new items to send to the kitchen.');
    }
    const orderData = {
      tableId: state.activeTableId,
      items: activeOrder.newItems.map(item => ({
        id: item.id,
        qty: item.qty,
        remarks: item.remarks,
      })),
      source: 'waiter',
    };
    const response = await submitOrder(orderData);
    if (response) {
      dispatch({type: 'SEND_TO_KITCHEN_SUCCESS'});
      await refreshPlacedItems(); // <-- Refresh from server right after sending
      return response;
    }
    throw new Error('Failed to submit order.');
  };
  
  const clearTableOrders = () => {
      dispatch({type: 'CLEAR_TABLE_ORDERS'});
  }

  const activeOrder = state.ordersByTable[state.activeTableId] || {
    newItems: [],
    placedItems: [],
  };

  return (
    <OrderContext.Provider
      value={{
        ...state,
        isOrderLoading,
        setTable,
        addItemToOrder,
        removeItem,
        updateQuantity,
        sendOrderToKitchen,
        clearTableOrders,
        activeOrder,
        refreshPlacedItems, // <-- Expose the new function
      }}>
      {children}
    </OrderContext.Provider>
  );
};