export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container mx-auto flex h-14 max-w-screen-2xl flex-col items-center justify-between px-4 md:flex-row md:px-8">
        <p className="text-muted-foreground text-center text-sm leading-loose md:text-left">
          Built by{' '}
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            ljwoon
          </a>
          . The source code is available on{' '}
          <a
            href="https://github.com/ljwoon1211/claude-blog"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
