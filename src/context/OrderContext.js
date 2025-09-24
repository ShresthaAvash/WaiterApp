import React, {createContext, useReducer, useEffect, useContext, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from './AuthContext';
import {submitOrder} from '../api/orders';
import {fetchOrderForTable} from '../api/restaurant'; // <-- Import new function

export const OrderContext = createContext();

const orderReducer = (state, action) => {
  const {activeTableId} = state;
  const newOrdersByTable = {...state.ordersByTable};
  let currentOrder;

  // Ensure currentOrder is initialized properly even if activeTableId is null
  if (activeTableId) {
      currentOrder = newOrdersByTable[activeTableId] || { newItems: [], placedItems: [] };
  } else {
      currentOrder = { newItems: [], placedItems: [] };
  }


  switch (action.type) {
    case 'SET_STATE':
      return {...state, ...action.payload};

    case 'SET_TABLE':
      return {...state, activeTableId: action.payload.tableId};

    case 'ADD_ITEM': {
      const {item, quantity, remarks} = action.payload;
      const itemRemarks = remarks || null; 

      const newItems = [...currentOrder.newItems];
      const existingIndex = newItems.findIndex(
        i => i.id === item.id && i.remarks === itemRemarks
      );

      if (existingIndex > -1) {
        const updatedItem = { ...newItems[existingIndex], qty: newItems[existingIndex].qty + quantity };
        newItems[existingIndex] = updatedItem;
      } else {
        newItems.push({...item, qty: quantity, remarks: itemRemarks});
      }
      
      if (activeTableId) newOrdersByTable[activeTableId] = { ...currentOrder, newItems };
      return {...state, ordersByTable: newOrdersByTable};
    }
    
    case 'REMOVE_ITEM': {
      const newItems = currentOrder.newItems.filter(
        item => !(item.id === action.payload.id && item.remarks === action.payload.remarks)
      );
      if (activeTableId) newOrdersByTable[activeTableId] = { ...currentOrder, newItems };
      return {...state, ordersByTable: newOrdersByTable};
    }

    case 'UPDATE_QTY': {
      const newItems = currentOrder.newItems
        .map(item =>
          (item.id === action.payload.id && item.remarks === action.payload.remarks)
            ? {...item, qty: action.payload.qty}
            : item
        )
        .filter(item => item.qty > 0); 
      if (activeTableId) newOrdersByTable[activeTableId] = { ...currentOrder, newItems };
      return {...state, ordersByTable: newOrdersByTable};
    }

    case 'SET_PLACED_ITEMS':
      if (activeTableId) {
        newOrdersByTable[activeTableId] = { ...currentOrder, placedItems: action.payload.items };
      }
      return {...state, ordersByTable: newOrdersByTable};

    case 'SEND_TO_KITCHEN_SUCCESS':
      if (activeTableId && newOrdersByTable[activeTableId]) {
        newOrdersByTable[activeTableId] = {
          ...newOrdersByTable[activeTableId],
          newItems: [],
        };
      }
      return {...state, ordersByTable: newOrdersByTable};

    case 'CLEAR_TABLE_ORDERS':
        if (action.payload.tableId && newOrdersByTable[action.payload.tableId]) {
            delete newOrdersByTable[action.payload.tableId];
        }
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
  const {token, isLoading: isAuthLoading} = useContext(AuthContext);

  useEffect(() => {
    const loadState = async () => {
      if (isAuthLoading) {
        return; // Wait for authentication to resolve
      }
      if (token) {
        setOrderLoading(true);
        try {
          const savedState = await AsyncStorage.getItem(`waiterOrders_${token}`);
          if (savedState) {
            const parsed = JSON.parse(savedState);
            Object.keys(parsed.ordersByTable).forEach(tableId => {
              if(parsed.ordersByTable[tableId]) {
                parsed.ordersByTable[tableId].placedItems = [];
              }
            });
            dispatch({type: 'SET_STATE', payload: parsed});
          }
        } catch (e) {
          console.error("Failed to load order state:", e);
        } finally {
          setOrderLoading(false);
        }
      } else {
        // No token, so not loading anything.
        setOrderLoading(false);
      }
    };
    loadState();
  }, [token, isAuthLoading]);

  useEffect(() => {
    if (token && !isAuthLoading && !isOrderLoading) {
      const stateToSave = JSON.parse(JSON.stringify(state));
      Object.keys(stateToSave.ordersByTable).forEach(tableId => {
         if(stateToSave.ordersByTable[tableId]) {
            stateToSave.ordersByTable[tableId].placedItems = [];
         }
      });
      AsyncStorage.setItem(`waiterOrders_${token}`, JSON.stringify(stateToSave));
    }
  }, [state, token, isAuthLoading, isOrderLoading]);

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
      await refreshPlacedItems();
      return response;
    }
    throw new Error('Failed to submit order.');
  };
  
  const clearTableOrders = (tableId) => {
      dispatch({type: 'CLEAR_TABLE_ORDERS', payload: { tableId }});
  }

  const activeOrder = state.ordersByTable[state.activeTableId] || {
    newItems: [],
    placedItems: [],
  };
  
  const hasUnsentItems = (tableId) => {
    const order = state.ordersByTable[tableId];
    return order && order.newItems && order.newItems.length > 0;
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
        hasUnsentItems,
        refreshPlacedItems, 
      }}>
      {children}
    </OrderContext.Provider>
  );
};