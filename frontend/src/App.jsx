import { Box, Flex, Text, Input, Button, IconButton, useColorMode, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from "@chakra-ui/react";
import { FaMoon, FaSun } from "react-icons/fa";
import { IoSunny } from "react-icons/io5";
import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import countriesData from "world-countries";
import GlobeComponent from "./Globe";

function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Chakra UI modal control

  // const [formData, setFormData] = useState({
  //   hot_take: "",
  //   name: "",
  //   company: "",
  //   location: ""
  // });

  const [formData, setFormData] = useState({
    hot_take: "",
    name: "",
    company: "",
    location: "",
    latitude: null,
    longitude: null,
  });

  const [hotTakes, setHotTakes] = useState([]);

  useEffect(() => {
    const fetchHotTakes = async () => {
      try {
        const response = await axios.get("http://localhost:8000/get-hot-takes/");
        setHotTakes(response.data.hot_takes);
      } catch (error) {
        console.error("Error fetching hot takes:", error);
      }
    };

    fetchHotTakes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // const handleLocationChange = (selectedOption) => {
  //   setFormData({ ...formData, location: selectedOption.label });
  // };

  const handleLocationChange = async (selectedOption) => {
    const locationName = selectedOption.label;

    // Set location in state immediately
    setFormData({ ...formData, location: locationName });

    try {
      const API_KEY = "1e7ed4a5c5414164ba4fbfef4f8e9751";
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${locationName}&key=${API_KEY}`
      );

      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry;

        console.log("Latitude:", lat);
        console.log("Longitude:", lng);

        setFormData((prevData) => ({
          ...prevData,
          latitude: lat,
          longitude: lng,
        }));
      } else {
        console.error("No coordinates found for", locationName);
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
  };

  const countryOptions = countriesData.map((country) => ({
    value: country.cca2, // Country Code
    label: country.name.common, // Country Name
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8000/submit-hot-take/", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response:", response.data);
      alert("Hot Take Submitted Successfully!");

      // ✅ Update UI Immediately
      setHotTakes((prevHotTakes) => [response.data.data, ...prevHotTakes]);

      // Clear form and close modal
      setFormData({ hot_take: "", name: "", company: "", location: "", latitude: null, longitude: null });
      onClose();
    } catch (error) {
      console.error("Error submitting hot take:", error);
      alert("Submission failed! Check your connection.");
    }
  };

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

          {/* Right Section - Map Placeholder */}
          <Box
            flex="1"
            p={6}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
             <GlobeComponent hotTakes={hotTakes} />
          </Box>
        </Flex>
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
              <Select
                options={countryOptions}
                onChange={handleLocationChange}
                placeholder="Select a country..."
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: colorMode === "dark" ? "rgba(255,255,255,0.1)" : "white", 
                    borderColor: colorMode === "dark" ? "gray" : "#CBD5E0",
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
                }}
              />
              <br />
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