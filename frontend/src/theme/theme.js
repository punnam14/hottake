import { extendTheme, theme as chakraTheme } from "@chakra-ui/react"; 

const theme = extendTheme({
  ...chakraTheme, // Ensures it includes default values
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
});

export default theme;
