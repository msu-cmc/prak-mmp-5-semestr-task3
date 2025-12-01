import "./UserNothing.css"

const UserNothing = ({query, selectedRole}) => {
    return(
        <div
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                fontSize: "large",
                color: "var(--red-color)",
                fontFamily: "Main"
            }}
        >
            {(query === "" && selectedRole === "")?  
                "Тут пока пусто":
                "Ничего не найдено"
            }
        </div>
    )
}

export default UserNothing