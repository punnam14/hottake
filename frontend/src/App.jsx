import { Box, Text, Button, useColorMode } from "@chakra-ui/react"; 
import { useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa"; 

function App() {
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
  }, [colorMode]);

  return (
    <Box bg={colorMode === "dark" ? "gray.900" : "gray.100"} color={colorMode === "dark" ? "white" : "black"} minH="100vh" p={5} textAlign="center">
      <Button onClick={toggleColorMode} colorScheme="teal" mt={4}>
        Toggle {colorMode === "light" ? "Dark" : "Light"} Mode
      </Button>
    </Box>
  );
}

export default App;
