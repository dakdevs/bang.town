export default function AboutPage() {
  return (
    <main className="space-y-8 font-sans">
      <nav className="flex items-center gap-2 text-sm">
        <a href="/" className="text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </a>
      </nav>

      <article>
        <header>
          <h1 className="text-2xl mb-4 text-blue-500 bangers">About Bang.town</h1>
          <p className="text-gray-600 mb-6">
            Bang.town is a custom search engine utility that implements and extends the concept of "bang shortcuts"
            (popularized by DuckDuckGo) with several unique features designed to enhance your browsing experience.
          </p>
        </header>

        <div className="space-y-6">
          <section className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold text-lg mb-2 bangers">Bang Shortcuts</h2>
            <p className="text-gray-600 mb-2">
              Perform quick searches on different websites using bang commands (e.g., <code className="bg-gray-100 px-1 rounded">!g cats</code> to search Google for "cats").
            </p>
            <p className="text-gray-600">Built-in default bangs include:</p>
            <ul className="list-disc pl-6 mt-2 text-gray-600">
              <li><code className="bg-gray-100 px-1 rounded">!g</code> for Google</li>
              <li><code className="bg-gray-100 px-1 rounded">!yt</code> for YouTube</li>
              <li><code className="bg-gray-100 px-1 rounded">!w</code> for Wikipedia</li>
              <li><code className="bg-gray-100 px-1 rounded">!gh</code> for GitHub</li>
              <li><code className="bg-gray-100 px-1 rounded">!so</code> for Stack Overflow</li>
              <li>And several others</li>
            </ul>
            <div className="mt-4 space-y-3">
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <p className="text-gray-700">
                  <span className="font-semibold">DuckDuckGo Fallback:</span> If a bang isn't found in your custom or default bangs,
                  we automatically fall back to DuckDuckGo's extensive bang system, giving you access to thousands of additional shortcuts!
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-md border border-green-200">
                <p className="text-gray-700">
                  <span className="font-semibold">Custom Overrides:</span> You can override any default bang with your own custom URL.
                  Your custom bangs always take precedence, giving you complete control over your search shortcuts.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold text-lg mb-2 bangers">Custom Bang Management</h2>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Create your own custom bang shortcuts</li>
              <li>Each custom bang consists of a key and a URL pattern</li>
              <li>Smart validation prevents infinite loops</li>
              <li>Duplicate detection avoids conflicts with existing bangs</li>
            </ul>
          </section>

          <section className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold text-lg mb-2 bangers">Sharing Functionality</h2>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Share your custom bang configurations with others</li>
              <li>Generate shareable URLs that preserve all custom bang settings</li>
              <li>Support for both clipboard copying and native share API</li>
            </ul>
          </section>

          <section className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold text-lg mb-2 bangers">Search and Organization</h2>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Fuzzy search feature for finding specific bangs</li>
              <li>Organized interface showing both custom and default bangs</li>
              <li>Clear indication when custom bangs override defaults</li>
            </ul>
          </section>

          <section className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold text-lg mb-2 bangers">Browser Integration</h2>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Detailed setup instructions for Chrome-based browsers and Arc Browser</li>
              <li>Can be set up as a custom search engine in browsers</li>
              <li>Supports both <code className="bg-gray-100 px-1 rounded">!command</code> syntax and browser search shortcuts</li>
            </ul>
          </section>

          <section className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold text-lg mb-2 bangers">User Experience</h2>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Clean, modern interface with a playful design</li>
              <li>Responsive toast notifications for user actions</li>
              <li>Easy-to-use interface for managing bangs</li>
              <li>Quick return to settings using <code className="bg-gray-100 px-1 rounded">!settings</code> command</li>
            </ul>
          </section>
        </div>

        <footer className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-gray-700">
            Bang.town serves as a search shortcut manager that allows users to create their own ecosystem of search shortcuts,
            making it faster and more efficient to search across multiple websites. It's particularly useful for power users
            who frequently search across different platforms and want to streamline their workflow.
          </p>
        </footer>
      </article>
    </main>
  )
} 