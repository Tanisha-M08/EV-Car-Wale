async function performLogout(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  try {
    // 1. Call the existing logout endpoint
    const response = await fetch('/auth/logout');
    if (!response.ok) {
      console.warn('Logout endpoint returned non-ok status:', response.status);
    }
  } catch (err) {
    console.error('Logout request failed:', err);
  }

  // 2. Clear all frontend authentication state
  localStorage.removeItem('is_logged_in');
  localStorage.removeItem('evcarwale_auth_user');
  localStorage.removeItem('ev_wishlist_logged_in');
  sessionStorage.clear();

  // 3. Update the navbar immediately
  if (typeof window.updateAuthUI === 'function') {
    window.updateAuthUI(null);
  }

  // 4. Verify authentication status
  try {
    const meRes = await fetch('/api/auth/me');
    if (meRes.ok) {
      const meData = await meRes.json();
      if (meData.loggedIn && typeof window.updateAuthUI === 'function') {
        window.updateAuthUI(meData.user);
      } else if (typeof window.updateAuthUI === 'function') {
        window.updateAuthUI(null);
      }
    }
  } catch (e) {
    console.error('Auth check after logout failed:', e);
  }

  // 5. Redirect the user to the Home page
  window.location.href = '/';
}

window.performLogout = performLogout;

const WishlistService = {
  getLocalStorageKey() {
    const user = localStorage.getItem('evcarwale_auth_user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed && parsed.email) {
          return `ev_wishlist_${parsed.email}`;
        }
      } catch (e) {}
    }
    return 'ev_wishlist_anonymous';
  },

  isLoggedIn() {
    return localStorage.getItem('is_logged_in') === 'true';
  },

  async getWishlist() {
    const key = this.getLocalStorageKey();
    const localData = localStorage.getItem(key);
    let wishlist = localData ? JSON.parse(localData) : [];

    if (this.isLoggedIn()) {
      try {
        const res = await fetch('/api/favourites');
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && Array.isArray(resData.data)) {
            const dbIds = resData.data;
            const merged = [];
            for (const id of dbIds) {
              const existing = wishlist.find(c => c.id === id);
              if (existing) {
                merged.push(existing);
              } else {
                merged.push({ id });
              }
            }
            wishlist = merged;
          }
        }
      } catch (err) {
        console.error('Failed to sync wishlist from backend:', err);
      }
    }

    // Enrich items missing properties using /data/cars.json
    const needsEnrichment = wishlist.some(c => !c.name || !c.brand || !c.image);
    if (needsEnrichment) {
      try {
        const carsRes = await fetch('/data/cars.json');
        if (carsRes.ok) {
          const text = await carsRes.text();
          const cleanText = text.replace(/,(\s*[\]}])/g, '$1');
          const allCars = JSON.parse(cleanText);
          wishlist = wishlist.map(item => {
            if (!item.name || !item.brand || !item.image) {
              const match = allCars.find(c => c.id === item.id);
              if (match) {
                return { ...match, ...item };
              }
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(wishlist));
        }
      } catch (err) {
        console.error('Failed to enrich wishlist:', err);
      }
    }

    return wishlist;
  },

  async addWishlist(carObj) {
    if (!carObj || !carObj.id) return;
    const key = this.getLocalStorageKey();
    let wishlist = [];
    try {
      const localData = localStorage.getItem(key);
      wishlist = localData ? JSON.parse(localData) : [];
    } catch (e) {}

    if (!wishlist.some(c => c.id === carObj.id)) {
      wishlist.push(carObj);
      localStorage.setItem(key, JSON.stringify(wishlist));
      // Trigger a storage event manually for same-page sync if needed
      window.dispatchEvent(new Event('storage'));
    }

    if (this.isLoggedIn()) {
      try {
        await fetch('/api/favourites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ carId: carObj.id })
        });
      } catch (err) {
        console.error('Failed to save to backend:', err);
      }
    }
  },

  async removeWishlist(carId) {
    const key = this.getLocalStorageKey();
    let wishlist = [];
    try {
      const localData = localStorage.getItem(key);
      wishlist = localData ? JSON.parse(localData) : [];
    } catch (e) {}

    wishlist = wishlist.filter(c => c.id !== carId);
    localStorage.setItem(key, JSON.stringify(wishlist));
    // Trigger a storage event manually for same-page sync if needed
    window.dispatchEvent(new Event('storage'));

    if (this.isLoggedIn()) {
      try {
        await fetch(`/api/favourites/${carId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error('Failed to remove from backend:', err);
      }
    }
  }
};

window.WishlistService = WishlistService;
