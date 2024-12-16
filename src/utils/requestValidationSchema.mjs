export const newLinkValidationSchema = {
    longURL: {
        isURL: {
            errorMessage: 'Invalid URL'
        },
        notEmpty: {
            errorMessage: 'No URL was provided'
        },
        isLength: {
            max: 2047,
            errorMessage: 'URL is too long'
        }
    }
}

export const lookupValidationSchema = {
    shortURL: {
        isString: true,
        matches: {
            options: /^[a-zA-Z0-9_\-]{7,14}$/,
            errorMessage: 'Invalid short URL'
        },
        notEmpty: {
            errorMessage: 'No short URL was provided'
        }
    }
}