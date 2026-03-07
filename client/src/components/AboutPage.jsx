// Third HTML route, for the about page
// Contains information about the project
function AboutPage() {
  return (
    <div className="page">
      <h2>About This Application</h2>

      <section>
        <h3>Project Overview</h3>
        <p>
          This is Assignment 2 for CPS630 - Web Applications Development.
          The application demonstrates a full-stack web application using React for the frontend,
          Node.js with Express for the backend, and MongoDB for the database.
        </p>
      </section>

      <section>
        <h3>Features</h3>
        <ul>
          <li><strong>GET Request:</strong> Retrieves all items from the server</li>
          <li><strong>POST Request:</strong> Sends new item data to create items on the server</li>
          <li><strong>DELETE Request:</strong> Removes items from the server by ID</li>
          <li><strong>UPDATE Request:</strong> Allows for updating an existing review in the database via specified Game</li>
          <li><strong>Item Search by Game:</strong> Search and filter items by Game using GET request</li>
          <li><strong>Item Search by ReviewID:</strong> Search and filter items by ReviewID using GET request</li>
          <li><strong>Multi-page Navigation:</strong> Three different web pages to navigate between</li>
        </ul>
      </section>

      <section>
        <h3>Technology Stack</h3>
        <div className="tech-grid">
          <div>
            <h4>Frontend</h4>
            <ul>
              <li>React 19</li>
              <li>Vite</li>
              <li>CSS3</li>
            </ul>
          </div>
          <div>
            <h4>Backend</h4>
            <ul>
              <li>Node.js</li>
              <li>Express.js</li>
              <li>CORS</li>
              <li>MongoDB</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3>Server Information</h3>
        <p><strong>Backend URL:</strong> http://localhost:8080</p>
        <p><strong>API Base Path:</strong> /api/items</p>
        <p><strong>Methods:</strong> GET, POST, DELETE</p>
      </section>
    </div>
  );
}

export default AboutPage;
