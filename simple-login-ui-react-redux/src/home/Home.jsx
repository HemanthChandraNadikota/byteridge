import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { history } from '_helpers';
import { Navigate } from 'react-router-dom';
export { Home };

function Home() {
    const auth = useSelector(x => x.auth.value);

    if (auth?.role === 'Auditor' && history.location.pathname === "/") {
        return <Navigate to="/audit" />;
    }

    return (
        <div>
            <h1>Hi {auth?.firstName}!</h1>
            <p>You're logged in with React 18 + Redux & JWT!!</p>
            <p><Link to="/users">Manage Users</Link></p>
        </div>
    );
}
