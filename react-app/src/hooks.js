import { useState, useEffect } from "react";

const useFetch = (endpoint) => {
    const [data, setData] = useState([]);

    const [loading, setLoading] = useState(true);

    const getMainData = async () => {
        const response = await fetch(endpoint); // /api main
        const json = await response.json();
        if (response.status !== 200) throw Error()
        setData(json.data);
        setLoading(false);
    }


    useEffect(() => {
        getMainData();
    }, []);

    return [data, loading];
}

export { useFetch };