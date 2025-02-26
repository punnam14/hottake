import { Box, Text, IconButton, useColorMode } from "@chakra-ui/react"; 
import { useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa"; 

function App() {
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
  }, [colorMode]);

  return (
    <Box bg={colorMode === "dark" ? "gray.900" : "gray.100"} 
        color={colorMode === "dark" ? "white" : "black"} 
        minH="100vh">
      <IconButton
        position="absolute"
        top="1rem"
        right="1rem"
        onClick={toggleColorMode}
        icon={colorMode === "light" ? <FaSun /> : <FaMoon/>}
        variant="ghost"
        aria-label="Toggle dark mode"
        fontSize="1.5rem"
      />
    </Box>
  );
}

export default App;
