# Prelude Web Playground

This folder includes example apps using the web SDKs and the configuration required for different bundlers.

# How to use

1. First you need to build the shared react components used by the different playground apps:
    ```
    cd ./react-components
    npm run build
    cd ..
    ```

2. Setup your environment variables in the playground app of your choice:
    E.g., if you want to test `playground/vite-react`, copy the `env.local.example` to `env.local`, and fill the environment variables values.
    > To get your SDK key and session domain, ask the Prelude support.

3. Then you can go to any playground app folder and run the `dev` script:
    ```
    cd ./vite-react
    npm run dev
    ```

