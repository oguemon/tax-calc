const sass = require('sass');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/** @type {import('webpack').Configuration} */
const config = {
    // モード値を production に設定すると最適化された状態で、
    // development に設定するとソースマップ有効でJSファイルが出力される
    mode: 'development',

    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: {
      index: './sass/main.scss',
      index_ts: './ts/main.ts',
    },
    target: ['web'],
    output: {
      //  出力ファイルのディレクトリ名
        path: __dirname + '/assets',
      // 出力ファイル名
      filename: (pathData) => {
        // tsファイルならjsフォルダ内に出力
        return pathData.chunk.name === 'index_ts' ? 'js/output.js' : '[name].js';
      },
    },
    module: {
      rules: [
        {
          // 拡張子 .ts の場合
          test: /\.ts$/,
          // TypeScript をコンパイルする
          use: 'ts-loader',
        },
        {
          test: /\.scss$/,
          use: [
            // 別ファイルで出力
            MiniCssExtractPlugin.loader,
            // CSSをバンドルするための機能
            {
              loader: 'css-loader',
              options: {
                url: false,
              },
            },
            // SassからCSSへ変換
            {
              loader: 'sass-loader',
              options: {
                // dart-sassを使う
                implementation: sass,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      // /js/css.js を出力しない
      new RemoveEmptyScriptsPlugin(),
      // cssファイルを別ファイルで出力
      new MiniCssExtractPlugin({
        filename: './css/main.css',
      }),
    ],
    // ソースマップを出力
    devtool: "source-map",
    // import 文で .ts ファイルを解決するため
    // これを定義しないと import 文で拡張子を書く必要が生まれる。
    // フロントエンドの開発では拡張子を省略することが多いので、
    // 記載したほうがトラブルに巻き込まれにくい。
    resolve: {
      // 拡張子を配列で指定
      extensions: [
        '.ts', '.js',
      ],
    },
    devServer: {
      static: {
        directory: __dirname,
      },
      host: '0.0.0.0',
      compress: true,
    },
    // バンドルを除外するライブラリ
    externals: {
        moment: 'moment'
    },
};

module.exports = (env, argv) => {
  // 本番ビルドならソースマップを出力しない
  if (argv.mode === 'production') {
    config.devtool = false;
  }

  return config;
};
