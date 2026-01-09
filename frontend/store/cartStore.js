import { create } from 'zustand';

const useCartStore = create((set) => ({
      items: [],
      
      addItem: (product) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product_id === product.product_id
          );
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product_id === product.product_id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          
          return {
            items: [...state.items, { ...product, quantity: 1 }],
          };
        });
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product_id !== productId),
        }));
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set((state) => ({
            items: state.items.filter((item) => item.product_id !== productId),
          }));
          return;
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.product_id === productId ? { ...item, quantity } : item
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        return useCartStore.getState().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      
      getItemCount: () => {
        return useCartStore.getState().items.reduce(
          (count, item) => count + item.quantity,
          0
        );
      },
    })
);

export default useCartStore;

