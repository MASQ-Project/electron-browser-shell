# electron-browser-shell
This repo is forked from [electron-browser-shell](https://github.com/samuelmaddock/electron-browser-shell) and modified for the MASQ Browser.
Modifications may be contributed back to the original repository and the modified `electron-chrome-extensions` is published under npm scope `@masq-project`.

[shell](https://github.com/samuelmaddock/electron-browser-shell/blob/master/packages/shell) is not included in this fork, rather a basic electron browser app was added to include DevTools and special extension DevTools consoles to monitor extension actions for development.

[electron-browser-shell](https://github.com/samuelmaddock/electron-browser-shell) is licensed under [GPLv3 license](./LICENSE).

## Packages
| Name                                                                                                                                 | Description                                                    | Package                                  |
|--------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------|------------------------------------------|
| [electron-chrome-extensions](https://github.com/MASQ-Project/electron-browser-shell/tree/master/packages/electron-chrome-extensions) | Adds additional API support for Chrome extensions to Electron. | @masq-project/electron-chrome-extensions |


<!-- GETTING STARTED IN DEVELOPMENT -->

## Getting Started

1. Install the packages
    ```sh
    yarn
    ```
2. Run the application

    ```sh
    yarn start
    ```

3. Or run the application with node debug logs enabled
    ```sh
    yarn start:debug
    ```

## License
GPL-3

For proprietary use, please [contact Samuel Maddock](mailto:sam@samuelmaddock.com?subject=electron-chrome-extensions%20license) or [sponsor him on GitHub](https://github.com/sponsors/samuelmaddock/) under the appropriate tier to [acquire a proprietary-use license](https://github.com/samuelmaddock/electron-browser-shell/blob/master/LICENSE-PATRON.md). These contributions help make development and maintenance of this project more sustainable and show appreciation for the work thus far.

Contributor license agreement
By sending a pull request, you hereby grant to owners and users of the electron-browser-shell project a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare derivative works of, publicly display, publicly perform, sublicense, and distribute your contributions and such derivative works.

The owners of the electron-browser-shell project will also be granted the right to relicense the contributed source code and its derivative works.
