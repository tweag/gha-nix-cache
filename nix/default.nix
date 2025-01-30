{
  system ? builtins.currentSystem,
  npins ? import ./npins,
  pkgs ? import npins.nixpkgs {
    inherit system;
    overlays = [ ];
    config = { };
  },
}:
rec {
  check = pkgs.writeShellApplication {
    name = "check";
    runtimeInputs = [
      pkgs.actionlint
      pkgs.bun
      pkgs.nixfmt-rfc-style
    ];
    text = ''
      nixfmt --check -- ${builtins.toString ./.}/*.nix
      bun x xo
      actionlint
    '';
  };
  fmt = pkgs.writeShellApplication {
    name = "fmt";
    runtimeInputs = [
      pkgs.bun
      pkgs.nixfmt-rfc-style
    ];
    text = ''
      nixfmt -- ${builtins.toString ./.}/*.nix
      bun x xo --fix
    '';
  };
  shell = pkgs.mkShellNoCC {
    NPINS_DIRECTORY = builtins.toString ./npins;
    packages = [
      pkgs.npins
      pkgs.bun
      pkgs.act
      pkgs.actionlint
      pkgs.shellcheck
      pkgs.nixfmt-rfc-style
    ];
  };
}
