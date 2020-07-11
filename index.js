"use strict";
const btnSend = document.querySelector(".btn-submit")
const inpPhone = document.querySelector(".inpPhone_js")
const inpFIO = document.querySelector(".inpFIO_js")
const inpEmail = document.querySelector(".inpEmail_js")
let mess = document.querySelector(".mess")

btnSend.addEventListener("click", btnActive)
inpPhone.addEventListener('input', validPhone)
inpFIO.addEventListener('input', validFIO)
inpEmail.addEventListener('input', validEmail)


function btnActive() {
    const data = {
        name: inpFIO.value,
        email: inpEmail.value,
        phone: inpPhone.value
    }

    mess.innerHTML = ''
    if (validPhone() && validFIO() && validEmail()) {
        fetch(
            "https://cors-anywhere.herokuapp.com/" +
            "https://testforbackend.000webhostapp.com/",
            {
                method: "POST",
                body: JSON.stringify(data), // Объект в формате JSON
                withCredentials: true,
                headers: {
                    "Content-type": "application/json;charset=utf-8"
                }
            }
        )
            .then(response => {
                mess.innerHTML = "Данные успешно отправлены на сервер";
            })
            .catch(err => {
                console.log(
                    "Произошла ошибка соединения с сервером. Попробуйте позже"
                );
            });
    } else mess.innerHTML = 'Заполните все поля корректно'
}

/*
Валидация телефона в инпуте
Проверям начало строки, если это не +7, 07, 8, то пишем "некорректный номер"
Иначе пока не наберётся нужное количество символов пишем "короткий номер"
Иначе возвращаем regex строки
Не цифры удаляются. Лишнее удаляется
*/
// \+?[0-9]  ;  [^\+0-9]  ;  ^(\+|0|8)
function validPhone() {
    inpPhone.classList.add("in-valid")
    inpPhone.value = inpPhone.value.replace(/^[^(\+|0|8)]/, ''); // Удаляем, если начинается не с "+" "0" или "8"
    let phone = inpPhone.value;
    let result = phone.match(/^(07|\+7|8)\d{10}/);

    if (!(/^(07|\+7|8)/).test(phone) || !(/^(0|\+|8)/).test(phone)) {
        mess.innerHTML = "Некорректный номер. Номер должен начинаться на 07, +7 или 8"
        inpPhone.value = phoneFromString(phone);
    }
    else if (result === null) {
        mess.innerHTML = "Короткий номер"
        inpPhone.value = phoneFromString(phone);
    }
    else if (result !== null) {
        mess.innerHTML = "";
        inpPhone.classList.remove("in-valid")
        if (result[0].length < phone.length) inpPhone.value = phone.slice(0, result[0].length)
        return true
    }

    function phoneFromString(phone) {
        // Если в номере есть не цифры или начинается с "0"
        if ((/\D/).test(phone) || (/^0/).test(phone)) {
            // Если первый символ "+" или 0, то оставляем их, а дальше удаляем всё кроме цифр
            if (phone.substring(0, 1) == '+' || phone.substring(0, 1) == '0') {
                phone = phone.substring(1, 12) // так как первый символ +, то берём всё кроме него
                phone = "+" + phone.replace(/\D/g, '') // возвращаем первый +, а дальше только цифры
            } else {
                phone = phone.replace(/\D/g, '') // Удаляем все не цифры
                mess.innerHTML = "Вводить можно только цифры"
            }
        }
        return phone


    }

    return false // возвращаем false за исключением успешной валидации
}

/*
Правила ФИО
Начинается с заглавной буквы. Минимум 2 буквы в слове (есть имя Ян, фамилия Ли, в них 2 буквы)
Могут присутствовать "-" в двойных значениях, например, "Панкратов-Чёрный"
Всего может быть 3 слова
^[А-ЯЁ][а-яё]{1,}([-][А-ЯЁ][а-яё]{1,})?\s[А-ЯЁ][а-яё]{1,}([-][А-ЯЁ][а-яё]{1,})?\s[А-ЯЁ][а-яё]{1,}([-][А-ЯЁ][а-яё]{1,})?$
Квер-Заде Дончев-Бро Ала-Даниярочев
*/
function validFIO() {
    // Если вводятся символы, которые не предусмотрены для ввода ФИО
    let allowSym = true;
    if (/[^((А-ЯЁ)|(а-яё)|\-)|\s]/.test(inpFIO.value)) allowSym = false;

    // Устанавливаем стиль :invalid - удалим его, если всё верно введено
    inpFIO.classList.add("in-valid");

    inpFIO.value = inpFIO.value.replace(/[^((А-ЯЁ)|(а-яё)|\-)|\s]/, ''); // Удаляем, если не буквы и не "-"
    inpFIO.value = inpFIO.value.replace(/^\s/, ''); // Удаляем первый пробел
    inpFIO.value = inpFIO.value.replace('  ', ' '); // Удаляем лишние пробелы

    let fioArr = inpFIO.value.split(" ")

    if (fioArr.length <= 3) {
        if (fioArr.length < 3) {
            mess.innerHTML = "Введите полностью Имя Фамилия Отчество"
            if (!allowSym) mess.innerHTML = 'Вводить можно только русские буквы и знак "-"'
        }
        // Если введённые данные отвечают нашему стандарту
        else if (/^[А-ЯЁ][а-яё]{1,}([-][А-ЯЁ][а-яё]{1,})?\s[А-ЯЁ][а-яё]{1,}([-][А-ЯЁ][а-яё]{1,})?\s[А-ЯЁ][а-яё]{1,}([-][А-ЯЁ][а-яё]{1,})?$/.test(fioArr.join(" "))) {
            mess.innerHTML = ""
            inpFIO.classList.remove("in-valid");
            return true
        }

        fioArr.forEach((element, i, arr) => {
            if (element) {
                element = element[0].toUpperCase() + element.slice(1);
                // toUpperCase для символов идущим за знаком тире.
                if ((element.indexOf("-") != -1) && (element.length > (element.indexOf("-") + 1))) {
                    const ind = ((element.indexOf("-")) + 1)
                    const sym = element[ind].toUpperCase()
                    let elArr = element.split("-")
                    elArr[1] = elArr[1][0].toUpperCase() + elArr[1].slice(1)
                    element = elArr.join("-")
                }
                arr[i] = element
            }
        });
    }
    // Отрезаем, если указано больше 3х слов
    else if (fioArr.length > 3) {
        fioArr.splice(3, 1)
    }

    inpFIO.value = fioArr.join(" ")

    return false; // возвращаем false за исключением успешной валидации
}


/*
Валидация email
*/
function validEmail() {
    mess.innerHTML = ''
    let email = inpEmail.value

    if (email.indexOf("@") != -1) {
        const emailChunk = email.split("@")
        // Если в email-е один знак @
        if ((emailChunk.length = 2) && (/gmail.com/.test(emailChunk[1]))) {
            emailChunk[1] = "gmail.com"
        }

        email = inpEmail.value = emailChunk.join("@")
    }

    inpEmail.value = inpEmail.value.replace(/[^A-z0-9_.\-@]/, ''); // Удаляем, если неразрешённые буквы

    if (!/^([A-z0-9_.-]{1,})@gmail.com$/.test(email)) {
        mess.innerHTML = 'Формат записи email@gmail.com';
        inpEmail.classList.add("in-valid");
    } else {
        inpEmail.classList.remove("in-valid");
        return true;
    }

    return false; //возвращаем false за исключением успешной валидации
}
