{
  system ? builtins.currentSystem,
  npins ? import ./npins,
  pkgs ? import npins.nixpkgs {
    inherit system;
    overlays = [ ];
    config = { };
  },
}@args:
(import ./default.nix args).shell
