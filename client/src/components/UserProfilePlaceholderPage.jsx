import { Link, useParams } from 'react-router-dom';

function UserProfilePlaceholderPage() {
  const { username } = useParams();
  const displayName = username ? decodeURIComponent(username) : 'User';

  return (
    <div className="page">
      <h2>{displayName}'s Profile</h2>
      <p>This profile page is a placeholder route and is not implemented yet.</p>
      <Link to="/user">Back to User Page</Link>
    </div>
  );
}

export default UserProfilePlaceholderPage;
