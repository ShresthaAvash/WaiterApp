import React, {createContext, useState, useReducer} from 'react';

export const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? {...item, qty: item.qty + 1}
              : item,
          ),
        };
      }
      return {...state, items: [...state.items, {...action.payload, qty: 1}]};
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? {...item, qty: action.payload.qty}
            : item,
        ).filter(item => item.qty > 0), // Remove if qty becomes 0
      };
    case 'SET_TABLE':
      return {...state, tableId: action.payload.tableId};
    case 'CLEAR_CART':
      return {items: [], tableId: null};
    default:
      return state;
  }
};

export const CartProvider = ({children}) => {
  const [state, dispatch] = useReducer(cartReducer, {items: [], tableId: null});

  const addItem = item => {
    dispatch({type: 'ADD_ITEM', payload: item});
  };

  const removeItem = id => {
    dispatch({type: 'REMOVE_ITEM', payload: {id}});
  };

  const updateQuantity = (id, qty) => {
    dispatch({type: 'UPDATE_QTY', payload: {id, qty}});
  };
  
  const setTable = tableId => {
    dispatch({type: 'SET_TABLE', payload: {tableId}});
  };

  const clearCart = () => {
    dispatch({type: 'CLEAR_CART'});
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        setTable,
        clearCart,
      }}>
      {children}
    </CartContext.Provider>
  );
};