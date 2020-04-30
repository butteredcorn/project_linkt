import React, { useState } from 'react';
import { useFetch } from "./hooks";
import './App.css';

function App() {

    const [data, loading] = useFetch('/api')


    return (
        <div className="App">
            <h1>Hello World from React!</h1>
            {loading ? ( "Loading..." ) : ( <div>{data}</div> )}
        </div>
    );   
}

export default App;
