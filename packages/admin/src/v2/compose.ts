export const compose = (...fns) => {
    return Base => {
        return fns.reduceRight((Component, hoc) => hoc(Component), Base);
    };
};
