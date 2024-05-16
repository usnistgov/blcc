{
    description = "BLCC - Building Lifecycle Cost Analysis";

    inputs.nixpkgs.url = "nixpkgs";
    inputs.flake-utils.url = "github:numtide/flake-utils";

    outputs = { self, nixpkgs, flake-utils }:
        flake-utils.lib.eachDefaultSystem (system:
            let
                pkgs = import nixpkgs {
                    inherit system;
                    overlays = [ overlay ];
                };
                overlay = (final: prev: {
                    blcc = (final.callPackage ./. { } // {
                        backend = final.callPackage ./backend { };
                        frontend = final.callPackage ./frontend { };
                    });
                });
            in rec {
                inherit overlay;
                apps = {
                    dev = pkgs.blcc.dev;
                };
                defaultApp = apps.dev;
                packages = {
                    image = pkgs.blcc.image;
                    backend = pkgs.blcc.backend.backend;
                    frontend = pkgs.blcc.frontend.frontend;
                };
                defaultPackage = packages.image;
                checks = packages;
            }
        );
}