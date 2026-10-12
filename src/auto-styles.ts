import css from './styles.css';

// Keep server imports DOM-free, and share one stylesheet across bundle copies.
if (typeof document !== 'undefined' && !document.getElementById('stefans-spinners-styles')) {
  const style = document.createElement('style');
  style.id = 'stefans-spinners-styles';
  style.textContent = css;
  document.head.appendChild(style);
}
