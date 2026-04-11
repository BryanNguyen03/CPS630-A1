//Component for the about page, holds information about the application
function AboutPage() {
  return (
    <div className="page-shell">
      <h2 className="page-title">About This Application</h2>

      <section className="panel space-y-3">
        <h3 className="text-xl">Project Overview</h3>
        <p className="leading-7 text-text-muted">
          ReviewLog is a full-stack video game review web application built for Assignment 3 of
          CPS630 &ndash; Web Applications Development. Users can browse a catalog of games sourced from the IGDB API,
          post and manage reviews, discover other users in the community, and chat in real time on
          profile pages.
        </p>
      </section>

      <section className="panel space-y-3">
        <h3 className="text-xl">Features</h3>
        <ul className="list-disc space-y-2 pl-5 text-sm text-text-muted marker:text-brand-300">
          <li><strong>Games Catalog:</strong> Browse games with search and lazy-loaded results via Intersection Observer</li>
          <li><strong>Game Details:</strong> View game info, read reviews, and sort/filter reviews by rating</li>
          <li><strong>Review CRUD:</strong> Create (POST), read (GET), update (PATCH), and delete (DELETE) reviews with JWT authentication</li>
          <li><strong>Review Search:</strong> Filter reviews by game name or look up a specific review by its ID</li>
          <li><strong>User Authentication:</strong> Register and log in with hashed passwords (bcrypt) and JWT tokens</li>
          <li><strong>User Profiles:</strong> View any user's reviews, manage your own, and chat on profile pages</li>
          <li><strong>Community Page:</strong> Discover and search for other users</li>
          <li><strong>Real-Time Chat:</strong> Per-profile chat rooms powered by Socket.io with persistent message history</li>
          <li><strong>IGDB Integration:</strong> Game data fetched from the IGDB API via Twitch OAuth and cached in MongoDB</li>
        </ul>
      </section>

      <section className="panel space-y-3">
        <h3 className="text-xl">Technology Stack</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-edge bg-bg-700/55 p-4">
            <h4 className="mb-2 text-base text-brand-300">Frontend</h4>
            <ul className="space-y-1 text-sm text-text-muted">
              <li>React 19</li>
              <li>React Router 7</li>
              <li>Vite 7</li>
              <li>Tailwind CSS v4</li>
              <li>Socket.io Client</li>
            </ul>
          </div>
          <div className="rounded-xl border border-edge bg-bg-700/55 p-4">
            <h4 className="mb-2 text-base text-brand-300">Backend</h4>
            <ul className="space-y-1 text-sm text-text-muted">
              <li>Node.js</li>
              <li>Express 5</li>
              <li>MongoDB with Mongoose</li>
              <li>Socket.io</li>
              <li>JWT &amp; bcrypt (Auth)</li>
              <li>IGDB API (via Twitch OAuth)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="panel space-y-2">
        <h3 className="text-xl">API Endpoints</h3>
        <div className="space-y-3 text-sm text-text-muted">
          <div>
            <p className="mb-1 font-medium text-text-primary">/api/items</p>
            <p>GET (all reviews), POST (create), PATCH (update), DELETE (remove by ID)</p>
          </div>
          <div>
            <p className="mb-1 font-medium text-text-primary">/api/games</p>
            <p>GET (all games), GET /:id (single game), GET /:id/reviews (reviews for a game)</p>
          </div>
          <div>
            <p className="mb-1 font-medium text-text-primary">/api/users</p>
            <p>GET (all usernames)</p>
          </div>
          <div>
            <p className="mb-1 font-medium text-text-primary">/api/register &amp; /api/login</p>
            <p>POST (register a new user, log in with credentials)</p>
          </div>
          <div>
            <p className="mb-1 font-medium text-text-primary">/api/messages</p>
            <p>GET (chat history by room)</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
