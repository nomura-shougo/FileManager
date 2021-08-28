import path from "path";

/** エディタで補完を効かせるために型定義をインポート */
import { Configuration } from "webpack";

const Dotenv = require("dotenv-webpack");

const config: Configuration = {
  mode: "development",
  // セキュリティ対策として 'electron-renderer' ターゲットは使用しない
  target: "web",
  node: {
    __dirname: false,
    __filename: false,
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  entry: {
    // エントリーファイル
    app: "./src/index.tsx",
  },
  output: {
    // バンドルファイルの出力先（ここではプロジェクト直下の 'dist' ディレクトリ）
    path: path.resolve(__dirname, "build"),
    // webpack@5 + electron では必須の設定
    publicPath: "./",
    /**
     * エントリーセクションで名前を付けていれば [name] が使える
     * ここでは 'app.js' として出力される
     */
    filename: "[name].js",
    // 画像などのアセット類は 'assets' フォルダへ配置する
    assetModuleFilename: "assets/[name][ext]",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    esmodules: true,
                  },
                },
              ],
              "@babel/preset-react",
            ],
          },
        },
      },
      {
        /**
         * 拡張子 '.ts' または '.tsx' （正規表現）のファイルを 'ts-loader' で処理
         * node_modules ディレクトリは除外する
         */
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: [/\.s[ac]ss$/i, /\.css$/i],
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        /** 画像やフォントなどのアセット類 */
        test: /\.(bmp|ico|gif|jpe?g|png|svg|ttf|eot|woff?2?)$/,
        /** アセット類も同様に asset/inline は使用しない */
        /** なお、webpack@5.x では file-loader or url-loader は不要になった */
        type: "asset/resource",
      },
    ],
  },
  plugins: [new Dotenv()],
  /**
   * developmentモードではソースマップを付ける
   *
   * レンダラープロセスでは、ソースマップがないと
   * electron のデベロッパーコンソールに 'Uncaught EvalError' が
   * 表示されてしまうことに注意
   */
  devtool: "inline-source-map",
};

export default config;
