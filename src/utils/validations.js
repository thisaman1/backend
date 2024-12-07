

function isEmpty(params) {
    return params?.trim()==="";
}

function isValidEmail(params) {
    params.trim();
    const patt = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}$/;
    return patt.test(params);
}

function isValidPassword(params) {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    // console.log(params)
    return regex.test(params);
}

export {isEmpty,isValidEmail,isValidPassword};