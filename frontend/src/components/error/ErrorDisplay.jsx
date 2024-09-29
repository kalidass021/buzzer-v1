import { useRouteError } from 'react-router-dom';

const ErrorDisplay = () => {
    const err = useRouteError();
    console.log('err', err);
  return <div>
    <h1>OOPS!!</h1>
    <h2>Something went wrong</h2>
    <h3>
        {err.status}: {err.statusText}
    </h3>
    <h3>{err.datad}</h3>
  </div>;
};

export default ErrorDisplay;
