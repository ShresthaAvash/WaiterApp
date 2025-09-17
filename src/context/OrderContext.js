import React, {createContext, useReducer, useEffect, useContext, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from './AuthContext';
import {submitOrder} from '../api/orders';

export const OrderContext = createContext();

const orderReducer = (state, action) => {
  const {activeTableId} = state;
  const newOrdersByTable = {...state.ordersByTable};
  const currentOrder = newOrdersByTable[activeTableId] || { newItems: [], placedItems: [] };

  switch (action.type) {
    // ... (keep SET_STATE, SET_TABLE cases) ...
    case 'SET_STATE':
      return {...state, ...action.payload};

    case 'SET_TABLE':
      return {...state, activeTableId: action.payload.tableId};

    case 'ADD_ITEM':
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
    
    // --- START OF FIX ---
    case 'REMOVE_ITEM':
      currentOrder.newItems = currentOrder.newItems.filter(
        item => !(item.id === action.payload.id && item.remarks === action.payload.remarks)
      );
      newOrdersByTable[activeTableId] = currentOrder;
      return {...state, ordersByTable: newOrdersByTable};

    case 'UPDATE_QTY':
      currentOrder.newItems = currentOrder.newItems
        .map(item =>
          (item.id === action.payload.id && item.remarks === action.payload.remarks)
            ? {...item, qty: action.payload.qty}
            : item
        )
        .filter(item => item.qty > 0); 
      newOrdersByTable[activeTableId] = currentOrder;
      return {...state, ordersByTable: newOrdersByTable};
    // --- END OF FIX ---

    case 'SEND_TO_KITCHEN_SUCCESS':
      // ... (keep this case as is) ...
      const sentItems = newOrdersByTable[activeTableId].newItems;
      newOrdersByTable[activeTableId] = {
        newItems: [],
        placedItems: [...(newOrdersByTable[activeTableId].placedItems || []), ...sentItems],
      };
      return {...state, ordersByTable: newOrdersByTable};

    case 'CLEAR_TABLE_ORDERS':
        // ... (keep this case as is) ...
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

  // ... (keep useEffect hooks as they are) ...
  useEffect(() => {
    const loadState = async () => {
      setOrderLoading(true);
      if (token) {
        const savedState = await AsyncStorage.getItem(`waiterOrders_${token}`);
        if (savedState) {
          dispatch({type: 'SET_STATE', payload: JSON.parse(savedState)});
        }
      }
      setOrderLoading(false);
    };
    loadState();
  }, [token]);

  useEffect(() => {
    if (token && !isOrderLoading) {
      AsyncStorage.setItem(`waiterOrders_${token}`, JSON.stringify(state));
    }
  }, [state, token, isOrderLoading]);

  // --- START OF FIX ---
  const removeItem = (id, remarks) => {
    dispatch({type: 'REMOVE_ITEM', payload: {id, remarks: remarks || null}});
  };

  const updateQuantity = (id, qty, remarks) => {
    dispatch({type: 'UPDATE_QTY', payload: {id, qty, remarks: remarks || null}});
  };
  // --- END OF FIX ---

  // ... (keep other functions like setTable, addItemToOrder, etc. as they are)
  const setTable = tableId => {
    dispatch({type: 'SET_TABLE', payload: {tableId}});
  };

  const addItemToOrder = (item, quantity = 1, remarks = '') => {
    dispatch({type: 'ADD_ITEM', payload: {item, quantity, remarks}});
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
      }}>
      {children}
    </OrderContext.Provider>
  );
};