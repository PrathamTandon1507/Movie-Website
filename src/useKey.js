import { useEffect } from "react";

export function useKey(key, action) {
  useEffect(
    function () {
      function callback(e) {
        if (e.code.toLowerCase() === key.toLowerCase()) action();
      }
      document.addEventListener("keydown", callback);
      return function () {
        document.removeEventListener("keydown", callback); //CLEANUP: because event listeners will keep on accumulating with each time a movie is closed, so it will be checked multiple times
      };
    },
    [key, action]
  );
} //doesnt return eanythign because we dont need to return anything, just dealing with event handler
