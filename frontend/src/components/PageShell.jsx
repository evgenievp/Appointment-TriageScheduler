import SiteHeader from './SiteHeader';

// Общата рамка на вътрешните страници: sticky хедър + центрирано съдържание.
export default function PageShell({ active, children }) {
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
        {children}
      </main>
    </>
  );
}
