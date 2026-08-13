import PageShell from './PageShell';

// Скеле за страниците, които предстоят. Заглавие + едно изречение какво ще има тук.
// Замества се със същинската страница, не се разширява.
export default function PagePlaceholder({ title, active, children }) {
  return (
    <PageShell active={active}>
      <h1>{title}</h1>
      <p
        style={{
          color: 'var(--text-muted)',
          marginTop: 'var(--space-3)',
          maxWidth: 'var(--measure)',
        }}
      >
        {children}
      </p>
    </PageShell>
  );
}
