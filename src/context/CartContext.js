import React, {createContext, useReducer, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();

const cartReducer = (state, action) => {
  const {activeTableId} = state;
  // This line is crucial - it correctly includes the tableId in the cart object
  const currentCart = state.carts[activeTableId] || {items: [], tableId: activeTableId}; 
  let newCarts = {...state.carts};

  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'SET_TABLE':
      return {...state, activeTableId: action.payload.tableId};

    case 'ADD_ITEM':
      const {item, quantity} = action.payload;
      const existingIndex = currentCart.items.findIndex(i => i.id === item.id);
      let newItems;

      if (existingIndex > -1) {
        newItems = currentCart.items.map((i, index) =>
          index === existingIndex ? {...i, qty: i.qty + quantity} : i,
        );
      } else {
        newItems = [...currentCart.items, {...item, qty: quantity}];
      }
      // Ensure tableId is persisted with the cart
      newCarts[activeTableId] = {items: newItems, tableId: activeTableId};
      return {...state, carts: newCarts};

    case 'REMOVE_ITEM':
      const filteredItems = currentCart.items.filter(
        item => item.id !== action.payload.id,
      );
      newCarts[activeTableId] = {items: filteredItems, tableId: activeTableId};
      return {...state, carts: newCarts};

    case 'UPDATE_QTY':
      const updatedItems = currentCart.items
        .map(item =>
          item.id === action.payload.id
            ? {...item, qty: action.payload.qty}
            : item,
        )
        .filter(item => item.qty > 0);
      newCarts[activeTableId] = {items: updatedItems, tableId: activeTableId};
      return {...state, carts: newCarts};

    case 'CLEAR_CART':
      delete newCarts[activeTableId];
      return {...state, carts: newCarts};

    default:
      return state;
  }
};

export const CartProvider = ({children}) => {
  const [state, dispatch] = useReducer(cartReducer, {
    carts: {},
    activeTableId: null,
  });

  useEffect(() => {
    const loadCart = async () => {
      const savedCart = await AsyncStorage.getItem('waiterCarts');
      if (savedCart) {
        dispatch({type: 'SET_STATE', payload: JSON.parse(savedCart)});
      }
    };
    loadCart();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('waiterCarts', JSON.stringify(state));
  }, [state]);

  const addItem = (item, quantity = 1) => {
    dispatch({type: 'ADD_ITEM', payload: {item, quantity}});
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
  
  // This now correctly includes the tableId for the active cart
  const activeCart = state.carts[state.activeTableId] || {items: [], tableId: state.activeTableId};

  return (
    <CartContext.Provider
      value={{
        carts: state.carts,
        activeTableId: state.activeTableId,
        activeCart,
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