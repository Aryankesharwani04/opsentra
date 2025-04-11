import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Scrolltotop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scrolls to top on every route change
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};
export default Scrolltotop;
