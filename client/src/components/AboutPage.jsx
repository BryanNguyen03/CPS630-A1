// Third HTML route, for the about page
// Contains information about the project
function AboutPage() {
  return (
    <div className="page-shell">
      <h2 className="page-title">About This Application</h2>

      <section className="panel space-y-3">
        <h3 className="text-xl">Project Overview</h3>
        <p className="leading-7 text-text-muted">
          This is Assignment 2 for CPS630 - Web Applications Development.
          The application demonstrates a full-stack web application using React for the frontend,
          Node.js with Express for the backend, and MongoDB for the database.
        </p>
      </section>

      <section className="panel space-y-3">
        <h3 className="text-xl">Features</h3>
        <ul className="list-disc space-y-2 pl-5 text-sm text-text-muted marker:text-brand-300">
          <li><strong>GET Request:</strong> Retrieves all items from the server</li>
          <li><strong>POST Request:</strong> Sends new item data to create items on the server</li>
          <li><strong>DELETE Request:</strong> Removes items from the server by ID</li>
          <li><strong>UPDATE Request:</strong> Allows for updating an existing review in the database via specified Game</li>
          <li><strong>Item Search by Game:</strong> Search and filter items by Game using GET request</li>
          <li><strong>Item Search by ReviewID:</strong> Search and filter items by ReviewID using GET request</li>
          <li><strong>Multi-page Navigation:</strong> Three different web pages to navigate between</li>
        </ul>
      </section>

      <section className="panel space-y-3">
        <h3 className="text-xl">Technology Stack</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-edge bg-bg-700/55 p-4">
            <h4 className="mb-2 text-base text-brand-300">Frontend</h4>
            <ul className="space-y-1 text-sm text-text-muted">
              <li>React 19</li>
              <li>Vite</li>
              <li>CSS3</li>
            </ul>
          </div>
          <div className="rounded-xl border border-edge bg-bg-700/55 p-4">
            <h4 className="mb-2 text-base text-brand-300">Backend</h4>
            <ul className="space-y-1 text-sm text-text-muted">
              <li>Node.js</li>
              <li>Express.js</li>
              <li>CORS</li>
              <li>MongoDB</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="panel space-y-2">
        <h3 className="text-xl">Server Information</h3>
        <p className="text-sm text-text-muted"><strong className="text-text-primary">Backend URL:</strong> http://localhost:8080</p>
        <p className="text-sm text-text-muted"><strong className="text-text-primary">API Base Path:</strong> /api/items</p>
        <p className="text-sm text-text-muted"><strong className="text-text-primary">Methods:</strong> GET, POST, DELETE</p>
      </section>
    </div>
  );
}

export default AboutPage;
