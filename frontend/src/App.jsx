import { Box, Flex, Text, Input, Button, Textarea, IconButton, useColorMode, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from "@chakra-ui/react";
import { FaMoon, FaSun } from "react-icons/fa";
import { IoSunny } from "react-icons/io5";
import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import countriesData from "world-countries";
import GlobeComponent from "./Globe";
import { useToast } from "@chakra-ui/react";

function App() {
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isFeedbackOpen, onOpen: onFeedbackOpen, onClose: onFeedbackClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [hotTakes, setHotTakes] = useState([]);

  const countryOptions = countriesData.map((country) => ({
    value: country.cca2,
    label: country.name.common,
  }));

  const [feedbackData, setFeedbackData] = useState({
    name: "",
    feedback_text: "",
  });

  const handleFeedbackChange = (e) => {
    setFeedbackData({ ...feedbackData, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [formData, setFormData] = useState({
    hot_take: "",
    name: "",
    company: "",
    location: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("https://hottake.pro/api/submit-hot-take/", formData, {
        headers: { "Content-Type": "application/json" },
      });
      toast({
        title: "Hot Take Submitted!",
        description: "Your hot take has been successfully posted.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      setHotTakes((prevHotTakes) => [response.data.data, ...prevHotTakes]);
      setFormData({ hot_take: "", name: "", company: "", location: "" });
      onClose();
    } catch (error) {
      console.error("Submission Error:", error);
      toast({
        title: "Submission Failed",
        description: "There was an issue submitting your hot take.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://hottake.pro/api/submit-feedback/", feedbackData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your feedback.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      setFeedbackData({ name: "", feedback_text: "" });
      onFeedbackClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission Failed",
        description: "There was an issue submitting your feedback.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    const fetchHotTakes = async () => {
      try {
        const response = await axios.get("https://hottake.pro/api/get-hot-takes/");
        setHotTakes(response.data.hot_takes);
      } catch (error) {
        console.error("Error fetching hot takes:", error);
      }
    };

    fetchHotTakes();
  }, []);

  return (
    <Box
      bg={colorMode === "dark" ? "gray.900" : "gray.100"}
      color={colorMode === "dark" ? "white" : "black"}
      minH="100vh"
      px={{ base: "4", md: "10", lg: "20" }}
    >
      <Box position="absolute" top="0.5rem" left="1rem">
        <img src="/logo.png" alt="Hot Takes Logo" width="60" height="60" />
      </Box>
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

      <Flex
        minH="100vh"
        alignItems="flex-start"
        justifyContent="center"
        pt={{ md: "100" }}
      >
        <Flex
          w="100%"
          maxW="1200px"
          flexDirection={{ base: "column", md: "row" }}>
          <Box
            flex="1"
            p={6}
            bg={colorMode === "dark" ? "gray.800" : "gray.200"}
            borderRadius="lg"
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="3.5rem"
            maxH="600px"
            overflowY="auto"
            w="100%"
          >
            <Button variant="outline" w="100%" py="5" fontSize="lg" colorScheme="blue" onClick={onOpen}>
              Post
            </Button>
            <Box mt={6} w="100%" textAlign="center">
              <Text fontSize="xl" mb={3}>Recent Hot Takes</Text>
              {hotTakes.length === 0 ? (
                <Text>No hot takes yet...</Text>
              ) : (
                hotTakes.map((take) => (
                  <Box key={take.id} p={4} bg="gray.600" color="white" borderRadius="md" mb={2}>
                    <Text fontWeight="bold">{take.hot_take}</Text>
                    <Text fontSize="sm">{take.name}, {take.company} ({take.location})</Text>
                  </Box>
                ))
              )}
            </Box>
          </Box>

          <Box
            flex="1"
            p={6}
            display="flex"
            alignItems="center"
            justifyContent="center"
            mt="2rem"
          >
            <GlobeComponent hotTakes={hotTakes} />
          </Box>
        </Flex>
        <Box position="fixed" bottom="2rem" right="2rem" >
          <Button size="lg" variant="outline" fontSize="lg" colorScheme="blue" onClick={onFeedbackOpen}>
            Feedback
          </Button>
        </Box>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">Post Your Hot Take</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <Input name="hot_take" required placeholder="Your Hot Take" mb={3} value={formData.hot_take} onChange={handleChange} />
              <Input name="name" required placeholder="Name" mb={3} value={formData.name} onChange={handleChange} />
              <Input name="company" required placeholder="Company" mb={3} value={formData.company} onChange={handleChange} />
              <Select options={countryOptions} onChange={(selectedOption) => setFormData({ ...formData, location: selectedOption.label })}
                placeholder="Select a country..."
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: colorMode === "dark" ? "gray.900" : "white",
                    borderColor: colorMode === "dark" ? "gray.900" : "#CBD5E0",
                    color: colorMode === "dark" ? "white" : "black",
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: colorMode === "dark" ? "#1A202C" : "white",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: colorMode === "dark" ? "white" : "black",
                  }),
                  option: (base, { isFocused }) => ({
                    ...base,
                    backgroundColor: isFocused
                      ? colorMode === "dark"
                        ? "rgba(255, 255, 255, 0.2)"
                        : "#E2E8F0"
                      : "transparent",
                    color: colorMode === "dark" ? "white" : "black",
                  }),
                }}
              />
              <br />
              <Button type="submit" variant="outline" w="100%" colorScheme="blue" isLoading={loading} loadingText="Submitting..." isDisabled={loading}>
                Submit
              </Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isFeedbackOpen} onClose={onFeedbackClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">Submit Feedback</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleFeedbackSubmit}>
              <Input
                name="name"
                required
                placeholder="Your Name"
                mb={3}
                value={feedbackData.name}
                onChange={handleFeedbackChange}
              />
              <Textarea
                name="feedback_text"
                required
                placeholder="Your Feedback"
                mb={3}
                value={feedbackData.feedback_text}
                onChange={handleFeedbackChange}
                rows={3}
                resize="vertical"
              />
              <Button variant="outline" fontSize="lg" colorScheme="blue" type="submit" w="100%">
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