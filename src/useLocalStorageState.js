import { useState, useEffect } from "react";

export function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(function () {
    const storedVal = JSON.parse(localStorage.getItem(key));
    return storedVal ? storedVal : initialState;
  });
  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  ); //updates localStorage whenever watched is updated, due to useEffect
  return [value, setValue];
}
