import { GUEST_USER_ID } from "shared/consts/localstorage";

/**
* Определяет ID пользователя для создания сообщений
* Возвращает ID авторизованного пользователя или ID гостя для неавторизованных
*
* @param {Object} loggedUser - Объект авторизованного пользователя из Redux state
* @returns {number} - ID пользователя для сообщения
*/
export const getUserIdForMessages = (loggedUser) => {
    // Если пользователь авторизован и имеет валидный ID
    if (loggedUser && Number.isInteger(loggedUser.id) && loggedUser.id > 0) {
        return loggedUser.id;
    }

    // Для неавторизованных пользователей возвращаем ID гостя
    return GUEST_USER_ID;
};
