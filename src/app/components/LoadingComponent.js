import Image from 'next/image';

export const LoadingComponent = () => {
  return (
    <div className="loading-component flex center column">
      <Image src={`/img/brand/hand.png`} width={140} height={140} alt="" />
      <div>Loading...</div>
    </div>
  );
};
