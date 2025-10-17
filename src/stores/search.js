// src/stores/search.js

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSearchStore = defineStore('search', () => {
  const searchQuery = ref('');
  
  function setSearchQuery(query) {
    searchQuery.value = query;
  }
  
  function clearSearch() {
    searchQuery.value = '';
  }

  return { searchQuery, setSearchQuery, clearSearch };
});