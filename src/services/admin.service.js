import { Admin } from "../models/admin.model.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";

const deleteOrg = async (id) => {

    try {
        const org = await Admin.findById(id);
        if (!org) {
            throw new ApiError(404, "Organization not found");
        }

        const participants = await User.find({ college: org.name });

        if (participants.length > 0) {
            throw new ApiError(400, "Cannot delete organization with participants, please delete participants first");
        }

        await Admin.findByIdAndDelete(id);

        return "Organization deleted successfully";

    } catch (error) {
        throw error;
    }

}


export const adminService = { deleteOrg };
