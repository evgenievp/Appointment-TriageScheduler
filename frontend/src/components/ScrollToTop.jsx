import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Браузърът пази позицията на скрола при смяна на маршрут, а гридът с часовете е
// по-висок от екрана — без това човек попада насред следващата страница, без да е
// видял заглавието ѝ. Скокът е мигновен нарочно: плавно превъртане през цяла
// страница съдържание е по-дезориентиращо от самия скок.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}
