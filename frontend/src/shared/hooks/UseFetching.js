import {useCallback, useState} from "react";

export default function useFetching(callback) {
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState({errors: false, message: ""})

    const fetching = useCallback(async (param = undefined) => {
        setIsLoading(true)
        let response
        try {
            response = await callback(param)
            if (response.errors)
                setIsError({
                    errors: true,
                    message: response.data.message
                })
        } catch (e) {
            setIsError({
                errors: true,
                message: "Ошибка получения ответа."
            });
        }
        setIsLoading(false);
        return response
    }, [callback])

    return [fetching, isLoading, isError]
}
