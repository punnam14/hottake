import { extendTheme, theme as chakraTheme } from "@chakra-ui/react"; 

const theme = extendTheme({
  ...chakraTheme,
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
});

export default theme;
