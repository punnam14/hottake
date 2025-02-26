import { Box, Flex, Input, Button, IconButton, useColorMode, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from "@chakra-ui/react"; 
import { FaMoon, FaSun } from "react-icons/fa"; 
import { IoSunny } from "react-icons/io5";
import { useState } from "react";

function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Chakra UI modal control

  return (
    <Box 
      bg={colorMode === "dark" ? "gray.900" : "gray.100"} 
      color={colorMode === "dark" ? "white" : "black"} 
      minH="100vh"
      px={{ base: "4", md: "10", lg: "20" }} 
    >
      {/* Dark Mode Toggle Button */}
      <IconButton
        position="absolute"
        top="1rem"
        right="1rem"
        onClick={toggleColorMode}
        icon={colorMode === "light" ? <IoSunny /> : <FaMoon />}
        variant="ghost"
        aria-label="Toggle dark mode"
        fontSize="1.5rem"
      />

      {/* Main Layout */}
      <Flex 
        minH="100vh" 
        alignItems="start"
        justifyContent="center"
        pt={{ md: "150" }}
      >
        <Flex 
          w="100%" 
          maxW="1200px" 
          flexDirection={{ base: "column", md: "row" }} 
          gap={6}
        >
          {/* Left Section - Post Button */}
          <Box 
            flex="1" 
            p={6} 
            bg={colorMode === "dark" ? "gray.800" : "gray.200"} 
            borderRadius="lg"
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="3.5rem"
          >
            {/* Open Modal when clicked */}
            <Button variant="outline" w="100%" colorScheme="blue" onClick={onOpen}>
              Post
            </Button>

            {/* Placeholder for retrieved posts */}
            <Box mt={6} w="100%" textAlign="center">
              <Box p={4} bg="gray.600" color="white" borderRadius="md">
                Retrieved Hot Takes (Mock Data)
              </Box>
            </Box>
          </Box>

          {/* Right Section - Map Placeholder */}
          <Box 
            flex="1" 
            p={6} 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
          >
            <Box 
              w="80%" 
              h="60%" 
              bg="gray.500" 
              borderRadius="md" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
            >
              Map Placeholder
            </Box>
          </Box>
        </Flex>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">Post Your Hot Take</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={(e) => {
              e.preventDefault(); 
              onClose(); 
            }}>
              <Input required placeholder="Your Hot Take" mb={3} />
              <Input required placeholder="Name" mb={3} />
              <Input required placeholder="Company" mb={3} />
              <Input required placeholder="Location" mb={3} />
              <Button type="submit" variant="outline" w="100%" colorScheme="blue">
                Submit
              </Button>
            </form> 
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default App;

