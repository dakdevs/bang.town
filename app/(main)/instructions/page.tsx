export default function InstructionsPage() {
  return (
    <main className="space-y-8 font-sans">
      <nav className="flex items-center gap-2 text-sm">
        <a href="/" className="text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </a>
      </nav>

      <article>
        <section>
          <header>
            <h1 className="text-2xl mb-4 text-primary bangers">Chrome-based Browser Setup</h1>
          </header>
          <div className="space-y-4">
            <section className="bg-surface p-4 rounded-lg">
              <h2 className="font-semibold mb-2 bangers">1. Open Chrome Settings</h2>
              <p className="text-text-light">
                Click the three dots menu (⋮) in the top right corner and select <span className="font-mono bg-accent px-1 rounded">Settings</span>
              </p>
            </section>

            <section className="bg-surface p-4 rounded-lg">
              <h2 className="font-semibold mb-2 bangers">2. Navigate to Search Engines</h2>
              <p className="text-text-light">
                In the left sidebar, click <span className="font-mono bg-accent px-1 rounded">Search engine</span>, then click <span className="font-mono bg-accent px-1 rounded">Manage search engines and site search</span>
              </p>
            </section>

            <section className="bg-surface p-4 rounded-lg">
              <h2 className="font-semibold mb-2 bangers">3. Add Custom Search Engine</h2>
              <p className="text-text-light mb-2">
                Under "Site search", click "Add":
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-light">
                <li>
                  <strong>Search engine</strong>: Enter "bang.town" or any name you prefer
                </li>
                <li>
                  <strong>Keyword</strong>: Enter a single letter (e.g., "b") - this makes it faster to access
                </li>
                <li>
                  <strong>URL</strong>: Copy and paste your custom search URL from the home page
                </li>
              </ul>
            </section>

            <section className="bg-surface p-4 rounded-lg">
              <h2 className="font-semibold mb-2 bangers">4. Using Your Bangs</h2>
              <p className="text-text-light mb-2">
                Now you can use your bangs in two ways:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-light">
                <li>Type <span className="font-mono bg-accent px-1 rounded">bang</span> in the address bar, press <span className="font-mono bg-accent px-1 rounded">Tab</span>, then type your bang command without the ! prefix (e.g., <span className="font-mono bg-accent px-1 rounded">g cats</span>)</li>
                <li>Type your bang command directly in the address bar (e.g., <span className="font-mono bg-accent px-1 rounded">!g cats</span>)</li>
              </ul>
            </section>
          </div>
        </section>

        <section>
          <header>
            <h1 className="text-2xl mb-4 text-primary bangers">Arc Browser Setup</h1>
          </header>
          <div className="space-y-4">
            <section className="bg-surface p-4 rounded-lg">
              <h2 className="font-semibold mb-2 bangers">1. Open Arc Settings</h2>
              <p className="text-text-light">
                Click <span className="font-mono bg-accent px-1 rounded">Arc</span> in the menu bar, then select <span className="font-mono bg-accent px-1 rounded">Settings</span>
              </p>
            </section>

            <section className="bg-surface p-4 rounded-lg">
              <h2 className="font-semibold mb-2 bangers">2. Navigate to Search Settings</h2>
              <p className="text-text-light">
                Click <span className="font-mono bg-accent px-1 rounded">Profiles</span> in the sidebar, then click <span className="font-mono bg-accent px-1 rounded">Search settings</span>
              </p>
            </section>

            <section className="bg-surface p-4 rounded-lg">
              <h2 className="font-semibold mb-2 bangers">3. Add Search Engine</h2>
              <p className="text-text-light mb-2">
                Click <span className="font-mono bg-accent px-1 rounded">+ Add search engine</span> and enter:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-light">
                <li>Name: <span className="font-mono bg-accent px-1 rounded">Bang Town</span></li>
                <li>Shortcut: <span className="font-mono bg-accent px-1 rounded">bang</span></li>
                <li>URL: Copy your Custom Search URL from the homepage</li>
              </ul>
            </section>

            <section className="bg-surface p-4 rounded-lg">
              <h2 className="font-semibold mb-2 bangers">4. Using Your Bangs</h2>
              <p className="text-text-light mb-2">
                In Arc, you can use your bangs in the command bar:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-light">
                <li>Press <span className="font-mono bg-accent px-1 rounded">⌘ + T</span> to open a new tab</li>
                <li>Type your bang command (e.g., <span className="font-mono bg-accent px-1 rounded">!g cats</span> or <span className="font-mono bg-accent px-1 rounded">!yt music</span>)</li>
              </ul>
            </section>

            <section className="bg-surface p-4 rounded-lg border-l-4 border-primary">
              <h2 className="font-semibold mb-2 bangers">Pro Tip</h2>
              <p className="text-text-light">
                Arc's command bar is accessible from any tab with <span className="font-mono bg-accent px-1 rounded">⌘ + T</span>, making your bangs always just a keystroke away!
              </p>
            </section>
          </div>
        </section>

        <section className="bg-surface p-4 rounded-lg border border-primary-light">
          <h2 className="font-semibold mb-2 bangers">Need to Update Your Bangs?</h2>
          <p className="text-text-light">
            Remember, you can always return to your settings page by using <span className="font-mono bg-accent px-1 rounded">!settings</span> in your browser's address bar.
          </p>
        </section>
      </article>
    </main>
  )
} 