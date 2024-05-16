{ dockerTools, writeShellScriptBin, blcc }: {
    image = dockerTools.buildLayeredImage {
        name = "blcc";
        tag = "latest";
        contents = with blcc; [ backend.backend frontend.frontend ];
        config = {
            Cmd = [ "./server" ];
            ExposedPorts = {
                "8080/tcp" = { };
            };
        };
    };
}