try {
    require('@tailwindcss/postcss');
    console.log('Success: @tailwindcss/postcss found');
} catch (e) {
    console.error('Error: @tailwindcss/postcss NOT found');
    console.error(e.message);
    try {
        require('tailwindcss');
        console.log('Success: tailwindcss found');
    } catch (e2) {
        console.error('Error: tailwindcss NOT found');
    }
}
