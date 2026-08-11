import SiteHeader from './SiteHeader';

// Скеле за страниците, които предстоят. Заглавие + едно изречение какво ще има тук.
// Замества се със същинската страница, не се разширява.
export default function PagePlaceholder({ title, active, children }) {
  return (
    <>
      <SiteHeader active={active} />
      <main
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: 'var(--section-padding-y-md) var(--gutter)',
        }}
      >
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
      </main>
    </>
  );
}
