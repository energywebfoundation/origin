export const generateNewUser = (): UserRegisterData => {
    const envUser = Cypress.env('testUser');
    const randomNumber = Math.round(Math.random() * 1000);

    return {
        ...envUser,
        firstName: `${randomNumber}${envUser.firstName}`,
        email: `${randomNumber}${envUser.email}`
    };
};
