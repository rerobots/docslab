import * as path from 'path';

export default () => ({
    name: 'docusaurus-theme-docslab',

    getThemePath() {
        return path.resolve(__dirname, './theme');
    }
});
