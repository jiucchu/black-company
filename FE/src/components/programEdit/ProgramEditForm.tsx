"use client";

import useProgramFormData from "@/hooks/useProgramFormData";
import { useState } from "react";
import ProgramForm from "../common/form/ProgramForm";
import MemberTable from "../common/memberTable/MemberTable";
import { AttendStatus } from "@/types/member";
import { useUpdateProgram } from "@/hooks/query/useProgramQuery";
import { ProgramInfo } from "@/types/program";
import { toast } from "react-toastify";

interface ProgramEditFormProps {
  programId: string;
  programInfo: Omit<ProgramInfo, "programId">;
}

export interface Members {
  beforeAttendStatus: AttendStatus;
  afterAttendStatus: AttendStatus;
}

const ProgramEditForm = ({ programId, programInfo }: ProgramEditFormProps) => {
  const formData = useProgramFormData(programInfo);
  const [members, setMembers] = useState<Map<number, Members>>(new Map());

  const { mutate: updateProgramMutate } = useUpdateProgram({
    programId: +programId,
    body: {
      title: formData.title,
      deadLine: formData.deadLine,
      content: formData.content,
      category: formData.category,
      type: formData.type,
      members: Array.from(
        members,
        ([memberId, { beforeAttendStatus, afterAttendStatus }]) => ({
          memberId,
          beforeAttendStatus,
          afterAttendStatus,
        }),
      ),
    },
  });

  const updateMembers = (
    memberId: number,
    before: AttendStatus,
    after: AttendStatus,
  ) => {
    const newMembers = new Map<number, Members>(members);

    if (before === after) {
      newMembers.delete(memberId);
    }
    if (before !== after) {
      newMembers.set(memberId, {
        beforeAttendStatus: before,
        afterAttendStatus: after,
      });
    }
    setMembers(newMembers);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.content ||
      !formData.deadLine ||
      !formData.category ||
      !formData.type
    ) {
      toast.error("모든 항목을 입력해주세요.");
      return;
    }
    updateProgramMutate();
  };

  return (
    <ProgramForm formType="edit" onSubmit={handleSubmit} {...formData}>
      <MemberTable
        formType="edit"
        members={members}
        setMembers={updateMembers}
        programId={+programId}
        isEditable={programInfo.programStatus !== "active"}
      />
    </ProgramForm>
  );
};
export default ProgramEditForm;
