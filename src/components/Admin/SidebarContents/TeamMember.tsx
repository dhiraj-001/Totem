import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface TeamMember {
  id: number;
  name: string;
  designation: string;
  profileUrl: string;
}

interface NewMember {
  name: string;
  designation: string;
  profileUrl: string;
}

const TeamMemberComponent = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState<NewMember>({
    name: "",
    designation: "",
    profileUrl: "/api/placeholder/128/128",
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await fetch(
        "https://totem-consultancy-alpha.vercel.app/api/team",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }

      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error("Error fetching team members:", error);
      alert("Failed to fetch team members. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setNewMember({
      name: member.name,
      designation: member.designation,
      profileUrl: member.profileUrl,
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingMember(null);
    setNewMember({
      name: "",
      designation: "",
      profileUrl: "/api/placeholder/128/128",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await fetch(
        `https://totem-consultancy-alpha.vercel.app/api/team/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete team member");
      }

      setMembers(members.filter((member) => member.id !== id));
      alert("Team member deleted successfully!");
    } catch (error) {
      console.error("Error deleting team member:", error);
      alert("Failed to delete team member. Please try again later.");
    }
  };

  const handleSave = async () => {
    try {
      if (
        !newMember.profileUrl ||
        newMember.profileUrl === "/api/placeholder/128/128"
      ) {
        alert("Please upload an image before saving.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const memberData = {
        name: newMember.name,
        designation: newMember.designation,
        profileUrl: newMember.profileUrl,
      };

      const url = editingMember
        ? `https://totem-consultancy-alpha.vercel.app/api/team/${editingMember.id}`
        : "https://totem-consultancy-alpha.vercel.app/api/team";

      const response = await fetch(url, {
        method: editingMember ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to ${editingMember ? "update" : "create"} team member`
        );
      }

      const updatedData = await response.json();

      if (editingMember) {
        setMembers(
          members.map((member) =>
            member.id === editingMember.id
              ? {
                  ...member,
                  name: updatedData.name,
                  designation: updatedData.designation,
                  profileUrl: updatedData.profileUrl,
                }
              : member
          )
        );
      } else {
        setMembers([...members, updatedData]);
      }

      setIsModalOpen(false);
      alert(
        `Team member ${editingMember ? "updated" : "created"} successfully!`
      );
    } catch (error) {
      console.error(
        `Error ${editingMember ? "updating" : "saving"} team member:`,
        error
      );
      alert(
        `Failed to ${
          editingMember ? "update" : "save"
        } team member. Please check the data and try again.`
      );
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dgagkq1cs/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNewMember((prevMember) => ({
          ...prevMember,
          profileUrl: data.secure_url,
        }));
        return data.secure_url;
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-black/5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-16">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
            Manage Team
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Add, edit, or remove team members
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 text-center text-blue-400">
            Loading team members...
          </div>
        ) : members.length === 0 ? (
          <div className="col-span-3 text-center text-blue-400">
            No team members found. Add your first team member!
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="relative bg-gradient-to-b from-black to-blue-900 mt-16 p-6 rounded-2xl w-full sm:w-[290px] h-[210px] shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border border-blue-900/20"
            >
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <div className="w-32 h-32 rounded-full border-4 border-blue-600 p-1 bg-black">
                  <img
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    src={member.profileUrl}
                  />
                </div>
              </div>
              <div className="absolute top-2 sm:top-4 right-3 sm:right-1 flex gap-2">
                <button
                  onClick={() => handleEdit(member)}
                  className="p-1.5 sm:p-2 text-blue-400 hover:text-blue-300 transition-colors"
                  title="Edit member"
                >
                  <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-1.5 sm:p-2 text-blue-400 hover:text-red-400 transition-colors"
                  title="Delete member"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="mt-16 text-center">
                <h3 className="text-lg sm:text-xl font-semibold uppercase text-blue-400">
                  {member.name}
                </h3>
                <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed">
                  {member.designation}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-b from-black to-blue-900 rounded-2xl p-8 w-full max-w-md relative border border-blue-900/20">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-blue-400 mb-6">
              {editingMember ? "Edit Member" : "Add New Member"}
            </h2>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-blue-300 mb-2"
                >
                  Name
                </label>
                <input
                  id="name"
                  className="w-full px-4 py-3 bg-black/50 text-white rounded-lg border border-blue-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                  placeholder="Enter member's name"
                />
              </div>
              <div>
                <label
                  htmlFor="designation"
                  className="block text-sm font-medium text-blue-300 mb-2"
                >
                  Designation
                </label>
                <input
                  id="designation"
                  className="w-full px-4 py-3 bg-black/50 text-white rounded-lg border border-blue-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  value={newMember.designation}
                  onChange={(e) =>
                    setNewMember({ ...newMember, designation: e.target.value })
                  }
                  placeholder="Enter member's designation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">
                  Profile Image
                </label>
                <div
                  {...getRootProps()}
                  className="w-full px-4 py-6 bg-black/50 text-white rounded-lg border border-dashed border-blue-900 hover:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center cursor-pointer"
                >
                  <input {...getInputProps()} />
                  <p className="text-sm text-blue-300">
                    Drag & drop an image here, or{" "}
                    <span className="text-blue-500 underline">
                      click to select
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMemberComponent;
